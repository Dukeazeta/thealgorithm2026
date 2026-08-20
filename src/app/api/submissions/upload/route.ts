import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { MAX_UPLOAD_IMAGE_BYTES, uploadTokenPayloadSchema } from "@/lib/contribution";
import {
  authorizeContributionUpload,
  ContributionError,
  finalizeContributionUpload,
} from "@/lib/contribution-server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = uploadTokenPayloadSchema.safeParse(
          JSON.parse(clientPayload ?? "null"),
        );
        if (!payload.success) {
          throw new ContributionError("Invalid upload credentials.", 401);
        }
        await authorizeContributionUpload(
          payload.data.batchId,
          payload.data.submissionId,
          payload.data.editToken,
          pathname,
        );
        return {
          allowedContentTypes: ["image/webp", "image/jpeg"],
          maximumSizeInBytes: MAX_UPLOAD_IMAGE_BYTES,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({
            batchId: payload.data.batchId,
            submissionId: payload.data.submissionId,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = uploadTokenPayloadSchema
          .omit({ editToken: true })
          .safeParse(JSON.parse(tokenPayload ?? "null"));
        if (!payload.success) return;
        await finalizeContributionUpload({
          ...payload.data,
          blob,
          trustedCallback: true,
        });
      },
    });
    return Response.json(response);
  } catch (error) {
    if (!(error instanceof ContributionError)) {
      console.error("Contribution upload authorization failed", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
    const status = error instanceof ContributionError ? error.status : 400;
    return Response.json(
      {
        error:
          error instanceof ContributionError
            ? error.message
            : "The upload could not be authorized.",
      },
      { status },
    );
  }
}
