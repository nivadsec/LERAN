import DashboardLayout from "@/app/dashboard/layout";

export default function AdminProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
