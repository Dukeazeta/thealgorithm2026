import { config } from "dotenv";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { and, eq, like, max } from "drizzle-orm";
import sharp from "sharp";

config({ path: ".env.local" });

import { getDatabase } from "../src/db/client";
import { galleryItems, mediaAssets } from "../src/db/schema";
import { deletePublicImage, uploadPublicImage } from "../src/lib/blob";

const sourceDirectory = "C:\\Users\\azeta\\Documents\\signoutgallery";
const supportedImage = /\.(jpe?g|png|webp)$/i;

function slugStem(filename: string) {
  return path
    .basename(filename, path.extname(filename))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const files = (await readdir(sourceDirectory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && supportedImage.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

  const database = getDatabase();
  const existingRows = await database
    .select({ slug: galleryItems.slug })
    .from(galleryItems)
    .where(like(galleryItems.slug, "signout-%"));
  const existingSlugs = new Set(existingRows.map((row) => row.slug));
  const [{ maxOrder }] = await database
    .select({ maxOrder: max(galleryItems.sortOrder) })
    .from(galleryItems);

  let nextSortOrder = Number(maxOrder ?? -1) + 1;
  let uploadedCount = 0;
  let skippedCount = 0;
  const failures: string[] = [];

  console.log(`Source images: ${files.length}`);
  console.log(`Existing sign-out records: ${existingRows.length}`);

  for (let index = 0; index < files.length; index += 1) {
    const filename = files[index];
    const stem = slugStem(filename);
    const slug = `signout-${stem}`;

    if (existingSlugs.has(slug)) {
      skippedCount += 1;
      continue;
    }

    const sourcePath = path.join(sourceDirectory, filename);
    let pathname: string | undefined;
    let mediaAssetId: string | undefined;

    try {
      const converted = await sharp(sourcePath)
        .rotate()
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
      const webpFile = new File([converted.data], `${stem}.webp`, {
        type: "image/webp",
      });
      const uploaded = await uploadPublicImage(webpFile, "gallery/signout");

      if (uploaded.contentType !== "image/webp") {
        throw new Error(`Unexpected uploaded content type: ${uploaded.contentType}`);
      }

      pathname = uploaded.pathname;
      mediaAssetId = crypto.randomUUID();
      const galleryItemId = crypto.randomUUID();
      const sequence = String(index + 1).padStart(3, "0");
      const alt = `The Algorithm Class of 2026 sign-out photo ${sequence}`;

      await database.insert(mediaAssets).values({
        id: mediaAssetId,
        blobUrl: uploaded.url,
        blobPathname: uploaded.pathname,
        mimeType: uploaded.contentType,
        byteSize: uploaded.byteSize,
        width: converted.info.width,
        height: converted.info.height,
        altText: alt,
        status: "ready",
      });

      await database.insert(galleryItems).values({
        id: galleryItemId,
        slug,
        title: `Sign-out memory ${sequence}`,
        category: "Celebrations",
        year: "2026",
        location: "Class of 2026 sign-out",
        mediaAssetId,
        alt,
        caption: "A sign-out memory from The Algorithm Class of 2026.",
        tag: "Sign-out",
        featured: false,
        status: "published",
        sortOrder: nextSortOrder,
      });

      existingSlugs.add(slug);
      nextSortOrder += 1;
      uploadedCount += 1;

      if (uploadedCount % 10 === 0 || uploadedCount === files.length) {
        console.log(`Imported ${uploadedCount}/${files.length}`);
      }
    } catch (error) {
      if (mediaAssetId) {
        await database
          .delete(mediaAssets)
          .where(eq(mediaAssets.id, mediaAssetId))
          .catch(() => undefined);
      }
      if (pathname) await deletePublicImage(pathname).catch(() => undefined);
      failures.push(`${filename}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log(`Uploaded: ${uploadedCount}`);
  console.log(`Skipped existing: ${skippedCount}`);
  console.log(`Failed: ${failures.length}`);

  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
