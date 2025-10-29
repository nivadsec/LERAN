import DashboardLayout from "@/app/dashboard/layout";

export default function DailyReportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
