import DashboardLayout from "@/app/dashboard/layout";

export default function AdminSmartBotLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
