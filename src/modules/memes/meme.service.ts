import prisma from "@/lib/prisma";
import { CreateMemeInput, GetMemesQueryInput } from "./meme.schema";
import { JWTPayload } from "../auth/auth.jwt";
import { hasPermission } from "../auth/auth.rbac";

export async function createMeme(input: CreateMemeInput, authorId?: string) {
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
}

export async function getMemes(query: GetMemesQueryInput) {
  const skip = (query.page - 1) * query.limit;

  let authorFilterId = query.authorId;
  if (!authorFilterId && query.authorEmail) {
    const user = await prisma.user.findUnique({
      where: { email: query.authorEmail.toLowerCase().trim() },
    });
    if (user) {
      authorFilterId = user.id;
    } else {
      // No user found with this email, return empty
      return {
        memes: [],
        pagination: { total: 0, page: query.page, limit: query.limit, totalPages: 0 },
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

  return {
    memes,
    pagination: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    },
  };
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
