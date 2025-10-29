import DashboardLayout from "@/app/dashboard/layout";

export default function AdminUsersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
