import DashboardLayout from "@/app/dashboard/layout";

export default function TestAnalysisLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
