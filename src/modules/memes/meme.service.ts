import prisma from "@/lib/prisma";
import { CreateMemeInput, GetMemesQueryInput } from "./meme.schema";
import { JWTPayload } from "../auth/auth.jwt";
import { hasPermission } from "../auth/auth.rbac";

export const IN_MEMORY_MEMES: any[] = [];

export async function createMeme(input: CreateMemeInput, authorId?: string) {
  const fallbackMeme = {
    id: `meme-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: input.title,
    templateId: input.templateId || null,
    previewUrl: input.previewUrl || null,
    layersJson: (input.layers || []) as unknown as object,
    width: input.width || 1080,
    height: input.height || 1080,
    isPublic: input.isPublic,
    authorId: authorId || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: input.authorEmail
      ? {
          id: authorId || `user-${Date.now()}`,
          name: input.authorEmail.split("@")[0],
          email: input.authorEmail.toLowerCase().trim(),
          avatarUrl: null,
        }
      : null,
  };

  IN_MEMORY_MEMES.unshift(fallbackMeme);

  try {
    let finalAuthorId = authorId;

    if (!finalAuthorId && input.authorEmail) {
      let user = await prisma.user.findUnique({
        where: { email: input.authorEmail.toLowerCase().trim() },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: input.authorEmail.toLowerCase().trim(),
            name: input.authorEmail.split("@")[0],
            role: "CREATOR",
          },
        });
      }
      finalAuthorId = user.id;
    }

    const meme = await prisma.meme.create({
      data: {
        title: input.title,
        templateId: input.templateId || null,
        previewUrl: input.previewUrl || null,
        layersJson: (input.layers || []) as unknown as object,
        width: input.width || 1080,
        height: input.height || 1080,
        isPublic: input.isPublic,
        authorId: finalAuthorId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    return meme;
  } catch (dbErr) {
    console.warn("Database unreachable in createMeme, falling back to memory store:", dbErr);
    return fallbackMeme;
  }
}

export async function getMemes(query: GetMemesQueryInput) {
  const skip = (query.page - 1) * query.limit;

  try {
    let authorFilterId = query.authorId;
    if (!authorFilterId && query.authorEmail) {
      const user = await prisma.user.findUnique({
        where: { email: query.authorEmail.toLowerCase().trim() },
      });
      if (user) {
        authorFilterId = user.id;
      } else {
        // No user found with this email, return in-memory matches if any
        const matchingInMemory = IN_MEMORY_MEMES.filter(
          (m) => m.author?.email?.toLowerCase() === query.authorEmail?.toLowerCase()
        );
        return {
          memes: matchingInMemory,
          pagination: { total: matchingInMemory.length, page: query.page, limit: query.limit, totalPages: 1 },
        };
      }
    }

    const whereClause: any = {
      ...(authorFilterId ? { authorId: authorFilterId } : { isPublic: true }),
    };

    const [memes, total] = await Promise.all([
      prisma.meme.findMany({
        where: whereClause,
        skip,
        take: query.limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.meme.count({
        where: whereClause,
      }),
    ]);

    const combinedMemes = [...IN_MEMORY_MEMES.filter(m => !authorFilterId || m.authorId === authorFilterId), ...memes];
    return {
      memes: combinedMemes,
      pagination: {
        total: total + IN_MEMORY_MEMES.length,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil((total + IN_MEMORY_MEMES.length) / query.limit),
      },
    };
  } catch (dbErr) {
    console.warn("Database unreachable in getMemes, returning in-memory memes:", dbErr);
    const filteredMemes = query.authorEmail
      ? IN_MEMORY_MEMES.filter((m) => m.author?.email?.toLowerCase() === query.authorEmail?.toLowerCase())
      : IN_MEMORY_MEMES;
    return {
      memes: filteredMemes,
      pagination: {
        total: filteredMemes.length,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(filteredMemes.length / query.limit) || 1,
      },
    };
  }
}

export async function getMemeById(id: string) {
  const meme = await prisma.meme.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  if (!meme) {
    throw new Error("Meme not found");
  }

  return meme;
}

export async function deleteMeme(id: string, user: JWTPayload) {
  const meme = await prisma.meme.findUnique({
    where: { id },
  });

  if (!meme) {
    throw new Error("Meme not found");
  }

  // RBAC Permission check: Author can delete own meme, ADMIN can delete any meme
  const isAuthor = meme.authorId === user.userId;
  const canDeleteAny = hasPermission(user.role, "delete:any_meme");

  if (!isAuthor && !canDeleteAny) {
    throw new Error("Unauthorized: You do not have permission to delete this meme.");
  }

  await prisma.meme.delete({
    where: { id },
  });

  return { id, deleted: true };
}

export async function updateMeme(
  id: string,
  input: { title?: string; previewUrl?: string; layers?: any; isPublic?: boolean },
  requesterEmail?: string | null,
  userId?: string | null
) {
  const meme = await prisma.meme.findUnique({
    where: { id },
    include: { author: true },
  });

  if (!meme) {
    throw new Error("Meme not found");
  }

  // Check ownership: strictly only the author can edit their own meme
  const authorEmail = meme.author?.email?.toLowerCase().trim();
  const reqEmail = requesterEmail?.toLowerCase().trim();
  const isOwner =
    (authorEmail && reqEmail && authorEmail === reqEmail) ||
    (userId && meme.authorId === userId);

  if (!isOwner) {
    throw new Error(
      "FORBIDDEN: You can only edit memes you uploaded. Admins have power to delete cards, but cannot edit memes created by others."
    );
  }

  const updated = await prisma.meme.update({
    where: { id },
    data: {
      ...(input.title ? { title: input.title.trim().toUpperCase() } : {}),
      ...(input.previewUrl ? { previewUrl: input.previewUrl } : {}),
      ...(input.layers ? { layersJson: input.layers as unknown as object } : {}),
      ...(typeof input.isPublic === "boolean" ? { isPublic: input.isPublic } : {}),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
  });

  return updated;
}

