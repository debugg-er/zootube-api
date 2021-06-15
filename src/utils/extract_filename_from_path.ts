export default function extractFilenameFromPath(path: string) {
    if (!path.startsWith("/")) throw new Error("path must start with /");

    return path.slice(path.lastIndexOf("/") + 1);
}
