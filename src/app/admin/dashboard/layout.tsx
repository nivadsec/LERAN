import DashboardLayout from "@/app/dashboard/layout";

export default function AdminDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
