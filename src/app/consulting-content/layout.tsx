import DashboardLayout from "@/app/dashboard/layout";

export default function ConsultingContentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
