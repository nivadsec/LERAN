import DashboardLayout from "@/app/dashboard/layout";

export default function WeeklyReportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}

    