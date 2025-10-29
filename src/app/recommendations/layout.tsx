import DashboardLayout from "@/app/dashboard/layout";

export default function RecommendationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
