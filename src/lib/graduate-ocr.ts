import type { GraduateExtraction } from "@/lib/types";

const fields = [
  { key: "slug", aliases: ["slug"] },
  { key: "name", aliases: ["full name", "student name", "name"] },
  { key: "nickname", aliases: ["nickname", "nick name"] },
  { key: "dob", aliases: ["date of birth", "dob", "birthday"] },
  {
    key: "favouriteColour",
    aliases: ["favourite colour", "favorite colour", "favourite color", "favorite color"],
  },
  {
    key: "adviceToYoungerLevel",
    aliases: ["advice to younger students", "advice to younger level", "advice"],
  },
  { key: "skillsHobbies", aliases: ["skills and hobbies", "skills hobbies", "hobbies"] },
  { key: "favoriteLecturer", aliases: ["favorite lecturer", "favourite lecturer"] },
  { key: "favoriteLevel", aliases: ["favorite level", "favourite level"] },
  { key: "worstLevel", aliases: ["worst level"] },
  { key: "departmentFriends", aliases: ["department friends", "class friends", "friends"] },
  { key: "favouriteQuote", aliases: ["favourite quote", "favorite quote", "quote"] },
  {
    key: "ifNotComputerScience",
    aliases: ["if not computer science", "if not cs", "if not computing"],
  },
  { key: "stayOrJapa", aliases: ["stay or japa", "stay or leave", "japa"] },
] as const;

type ExtractableField = (typeof fields)[number]["key"];
type FieldHit = { key: ExtractableField; value: string; line: number };

function clean(value: string) {
  return value
    .replace(/[|]/g, " ")
    .replace(/^\s*(?:[-*]\s+|\d+[.)]\s*)/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findField(line: string, lineNumber: number): FieldHit | null {
  const normalized = clean(line);
  const candidates = fields
    .flatMap(({ key, aliases }) => aliases.map((alias) => ({ key, alias })))
    .sort((a, b) => b.alias.length - a.alias.length);

  for (const { key, alias } of candidates) {
    const pattern = new RegExp(
      `^${escapeRegex(alias)}(?:\\s*[:=-]\\s*|\\s+)(.*)$`,
      "i",
    );
    const match = normalized.match(pattern);
    if (match) return { key, value: clean(match[1]), line: lineNumber };
    if (normalized.toLowerCase() === alias) return { key, value: "", line: lineNumber };
  }

  return null;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 100);
}

export function extractGraduateProfile(text: string): GraduateExtraction {
  const lines = text.split(/\r?\n/).map(clean).filter(Boolean);
  const hits = lines
    .map((line, index) => findField(line, index))
    .filter((hit): hit is FieldHit => Boolean(hit));
  const values = new Map<ExtractableField, string[]>();

  for (const [index, hit] of hits.entries()) {
    const nextHitLine = hits[index + 1]?.line ?? lines.length;
    const parts = hit.value ? [hit.value] : [];
    for (let line = hit.line + 1; line < nextHitLine; line += 1) {
      parts.push(lines[line]);
    }
    values.set(hit.key, parts);
  }

  const value = (key: ExtractableField) => clean((values.get(key) ?? []).join(" "));
  const name = value("name");
  const friends = (values.get("departmentFriends") ?? [])
    .join("\n")
    .split(/[,;|\n]+/)
    .map(clean)
    .filter(Boolean)
    .slice(0, 30);

  return {
    slug: value("slug") || slugify(name),
    name,
    nickname: value("nickname"),
    alt: value("name") ? `Portrait of ${name}` : "",
    dob: value("dob"),
    favouriteColour: value("favouriteColour"),
    adviceToYoungerLevel: value("adviceToYoungerLevel"),
    skillsHobbies: value("skillsHobbies"),
    favoriteLecturer: value("favoriteLecturer"),
    favoriteLevel: value("favoriteLevel"),
    worstLevel: value("worstLevel"),
    departmentFriends: friends,
    favouriteQuote: value("favouriteQuote"),
    ifNotComputerScience: value("ifNotComputerScience"),
    stayOrJapa: value("stayOrJapa"),
  };
}
