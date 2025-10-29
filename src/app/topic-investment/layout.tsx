import DashboardLayout from "@/app/dashboard/layout";

export default function TopicInvestmentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
