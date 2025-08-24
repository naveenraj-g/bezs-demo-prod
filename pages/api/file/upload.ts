import { prismaFileNest } from "@/lib/prisma";
import { auth } from "@/modules/auth/services/better-auth/auth";
import { IncomingForm } from "formidable";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await auth.api.getSession({
      headers: new Headers(
        Object.entries(req.headers).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.join(", ") : (v ?? ""),
        ])
      ),
    });

    if (!session) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const userId = session.user.id;

    const form = new IncomingForm({
      keepExtensions: true,
      maxFieldsSize: 250 * 1024 * 1024,
      multiples: false,
    });

    // Remove the Promise wrapper and use proper async/await
    const { fields, files } = await new Promise<{ fields: any; files: any }>(
      (resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            if ((err as Error).message.includes("maxFileSize exceeded")) {
              return reject(new Error("File size exceeded."));
            }
            return reject(err);
          }
          resolve({ fields, files });
        });
      }
    );

    const pathName = fields.pathName?.[0];
    const referenceType = fields.referenceType?.[0];
    const file = files.file?.[0];

    if (!file) {
      return res.status(400).json({ error: "Missing file or pathName" });
    }

    if (Array.isArray(files.file) && files.file.length > 1) {
      return res.status(400).json({ error: "Only one file is allowed." });
    }

    if (!pathName || !file) {
      return res.status(400).json({ error: "Missing file or pathName" });
    }

    const splittedPath = pathName.split("/");
    const formattedPathSlug = splittedPath.slice(0, 3).join("/");
    const appName = splittedPath[2];

    const adminAppStoreSettings =
      await prismaFileNest.appStorageSetting.findFirst({
        where: {
          appSlug: formattedPathSlug,
        },
      });

    if (!adminAppStoreSettings) {
      return res.status(403).json({
        error: `${appName} app doesn't have permission to store any files.`,
      });
    }

    if (file.size > adminAppStoreSettings?.maxFileSize) {
      return res.status(413).json({
        error: `File size exceeds ${adminAppStoreSettings?.maxFileSize} limit.`,
      });
    }

    if (adminAppStoreSettings.type !== "LOCAL") {
      return res.status(403).json({
        error: `${appName} assigned to different type of file storage method, not local storage.`,
      });
    }

    if (!adminAppStoreSettings.basePath || !adminAppStoreSettings.subFolder) {
      return res
        .status(500)
        .json({ error: "Base path for storage is not configured." });
    }

    const uploadDir = path.join(
      adminAppStoreSettings.basePath,
      (adminAppStoreSettings.subFolder ?? "").split("/").pop() || "",
      referenceType ? referenceType : ""
    );
    ensureDirectoryExists(uploadDir);

    const newFileName = `${Date.now()}-${file.originalFilename}`;
    const finalPath = path.join(uploadDir, newFileName);

    await fs.promises.copyFile(file.filepath, finalPath);
    await fs.promises.unlink(file.filepath);

    await prismaFileNest.userFile.create({
      data: {
        userId,
        appId: adminAppStoreSettings.appId,
        appName: adminAppStoreSettings.appName,
        appSlug: adminAppStoreSettings.appSlug,
        fileId: newFileName,
        fileName: file.originalFilename || newFileName,
        fileType: file.mimetype || "application/octet-stream",
        fileSize: file.size,
        filePathType: "LOCAL",
        filePath: finalPath,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Upload successful",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      success: false,
      error: "Upload failed",
    });
  }
}
