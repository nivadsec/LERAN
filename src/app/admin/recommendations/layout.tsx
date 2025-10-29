import DashboardLayout from "@/app/dashboard/layout";

export default function AdminRecommendationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
