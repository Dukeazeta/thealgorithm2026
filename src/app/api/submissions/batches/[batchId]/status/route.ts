import {
  ContributionError,
  getBearerToken,
  getContributionBatchStatus,
} from "@/lib/contribution-server";

type Context = { params: Promise<{ batchId: string }> };

export async function GET(request: Request, context: Context) {
  try {
    const { batchId } = await context.params;
    return Response.json(
      await getContributionBatchStatus(batchId, getBearerToken(request)),
    );
  } catch (error) {
    if (!(error instanceof ContributionError)) {
      console.error("Contribution status lookup failed", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
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
}
