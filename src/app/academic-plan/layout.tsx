import DashboardLayout from "@/app/dashboard/layout";

export default function AcademicPlanLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
