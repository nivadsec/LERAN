import DashboardLayout from "@/app/dashboard/layout";

export default function ReviewCalendarLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
