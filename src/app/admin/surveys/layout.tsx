import DashboardLayout from "@/app/dashboard/layout";

export default function AdminSurveysLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
