import DashboardLayout from "@/app/dashboard/layout";

export default function AdminLoginHistoryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
