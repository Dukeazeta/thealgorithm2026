import {
  completeContributionBatch,
  ContributionError,
} from "@/lib/contribution-server";

type Context = { params: Promise<{ batchId: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const { batchId } = await context.params;
    return Response.json(
      await completeContributionBatch(batchId, await request.json()),
    );
  } catch (error) {
    if (!(error instanceof ContributionError)) {
      console.error("Contribution completion failed", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
    return Response.json(
      {
        error:
          error instanceof ContributionError
            ? error.message
            : "The contribution batch could not be completed.",
      },
      { status: error instanceof ContributionError ? error.status : 500 },
    );
  }
}
