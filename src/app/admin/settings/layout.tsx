import DashboardLayout from "@/app/dashboard/layout";

export default function AdminSettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
