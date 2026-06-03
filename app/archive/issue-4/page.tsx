import Link from "next/link";
import { getIssueBySlug } from "@/lib/issues";
import { IssueView } from "@/app/components/IssueView";
import { notFound } from "next/navigation";

export default function Issue4Page() {
  const issue = getIssueBySlug("issue-4");
  if (!issue) notFound();

  return (
    <div className="max-w-6xl mx-auto px-6 pt-12 pb-16">
      <div className="mb-8 pb-6 border-b border-gray-200">
        <Link href="/archive" className="text-xs text-[#0E7490] hover:underline uppercase tracking-widest">
          ← Archive
        </Link>
        <div className="mt-3 text-sm text-gray-400">Issue {issue.number} · {issue.date}</div>
        <h1 className="font-sans text-3xl text-[#374151] tracking-tight leading-tight mt-1">
          {issue.title}
        </h1>
      </div>

      <IssueView issue={issue} showEarnings={false} />
    </div>
  );
}
