import { finalizeUploadSchema } from "@/lib/contribution";
import {
  ContributionError,
  finalizeContributionUpload,
  removeContributionItem,
} from "@/lib/contribution-server";

type Context = {
  params: Promise<{ batchId: string; submissionId: string }>;
};

function errorResponse(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof ContributionError
          ? error.message
          : "The photo could not be updated.",
    },
    { status: error instanceof ContributionError ? error.status : 500 },
  );
}

export async function POST(request: Request, context: Context) {
  try {
    const input = finalizeUploadSchema.safeParse(await request.json());
    if (!input.success) throw new ContributionError("Invalid finalization request.");
    const { batchId, submissionId } = await context.params;
    return Response.json(
      await finalizeContributionUpload({
        batchId,
        submissionId,
        editToken: input.data.editToken,
        blob: input.data.blob,
      }),
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const body = (await request.json()) as { editToken?: unknown };
    if (typeof body.editToken !== "string") {
      throw new ContributionError("Invalid removal request.");
    }
    const { batchId, submissionId } = await context.params;
    return Response.json(
      await removeContributionItem(batchId, submissionId, body.editToken),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
