import DashboardLayout from "@/app/dashboard/layout";

export default function AdminStrategicPlanLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
