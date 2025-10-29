import DashboardLayout from "@/app/dashboard/layout";

export default function AdminQnALayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
