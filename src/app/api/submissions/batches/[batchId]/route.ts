import {
  completeContributionBatch,
  ContributionError,
  getBearerToken,
  getContributionBatchStatus,
} from "@/lib/contribution-server";

type Context = { params: Promise<{ batchId: string }> };

function errorResponse(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof ContributionError
          ? error.message
          : "The contribution batch could not be loaded.",
    },
    { status: error instanceof ContributionError ? error.status : 500 },
  );
}

export async function GET(request: Request, context: Context) {
  try {
    const { batchId } = await context.params;
    return Response.json(
      await getContributionBatchStatus(batchId, getBearerToken(request)),
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const { batchId } = await context.params;
    return Response.json(
      await completeContributionBatch(batchId, await request.json()),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
