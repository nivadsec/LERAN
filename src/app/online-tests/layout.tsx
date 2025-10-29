import DashboardLayout from "@/app/dashboard/layout";

export default function OnlineTestsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
