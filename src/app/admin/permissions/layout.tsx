import DashboardLayout from "@/app/dashboard/layout";

export default function AdminPermissionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
