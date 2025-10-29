import DashboardLayout from "@/app/dashboard/layout";

export default function AdminMessagesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
