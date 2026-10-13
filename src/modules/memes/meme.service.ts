import prisma from "@/lib/prisma";
import { CreateMemeInput, GetMemesQueryInput } from "./meme.schema";
import { JWTPayload } from "../auth/auth.jwt";
import { hasPermission } from "../auth/auth.rbac";

export async function createMeme(input: CreateMemeInput, authorId?: string) {
  const meme = await prisma.meme.create({
    data: {
      title: input.title,
      templateId: input.templateId || null,
      previewUrl: input.previewUrl || null,
      layersJson: input.layers as unknown as object,
      width: input.width,
      height: input.height,
      isPublic: input.isPublic,
      authorId: authorId || null,
    },
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

  return meme;
}

export async function getMemes(query: GetMemesQueryInput) {
  const skip = (query.page - 1) * query.limit;

  const [memes, total] = await Promise.all([
    prisma.meme.findMany({
      where: {
        isPublic: true,
        ...(query.authorId ? { authorId: query.authorId } : {}),
      },
      skip,
      take: query.limit,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    }),
    prisma.meme.count({
      where: {
        isPublic: true,
        ...(query.authorId ? { authorId: query.authorId } : {}),
      },
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
