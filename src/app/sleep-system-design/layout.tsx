import DashboardLayout from "@/app/dashboard/layout";

export default function SleepSystemDesignLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
