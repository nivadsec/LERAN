import DashboardLayout from "@/app/dashboard/layout";

export default function AdminRequestsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
