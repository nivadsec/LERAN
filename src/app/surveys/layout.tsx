import DashboardLayout from "@/app/dashboard/layout";

export default function SurveysLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
