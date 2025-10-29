import DashboardLayout from "@/app/dashboard/layout";

export default function OnlineClassLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
