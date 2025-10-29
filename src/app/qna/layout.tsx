import DashboardLayout from "@/app/dashboard/layout";

export default function QnALayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
