import {
  ContributionError,
  createContributionBatch,
  getClientAddress,
} from "@/lib/contribution-server";

export async function POST(request: Request) {
  try {
    const result = await createContributionBatch(
      await request.json(),
      getClientAddress(request),
    );
    return Response.json(result, { status: 201 });
  } catch (error) {
    if (!(error instanceof ContributionError)) {
      console.error("Contribution batch creation failed", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
    const status = error instanceof ContributionError ? error.status : 500;
    const message =
      error instanceof ContributionError
        ? error.message
        : "The contribution batch could not be created.";
    return Response.json(
      { error: message },
      {
        status,
        headers: status === 429 ? { "Retry-After": "3600" } : undefined,
      },
    );
  }
}
