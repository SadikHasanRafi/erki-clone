import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { MessagesInbox } from "@/components/dashboard/MessagesInbox";
import { listMessages } from "@/lib/messages";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const messages = await listMessages();
  return (
    <div className="space-y-4">
      <Breadcrumb items={[{ label: "Messages" }]} />
      <h1 className="text-2xl font-bold text-zinc-900">Messages</h1>
      <MessagesInbox initial={messages} />
    </div>
  );
}
