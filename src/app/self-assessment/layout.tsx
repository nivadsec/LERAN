import DashboardLayout from "@/app/dashboard/layout";

export default function SelfAssessmentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
