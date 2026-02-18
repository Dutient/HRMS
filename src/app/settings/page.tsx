import { Settings, User, Palette, Bell, Shield, Clock } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-heading font-bold text-primary">Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage your account settings and preferences.</p>
            </div>

            {/* Settings Cards */}
            <div className="grid gap-4 md:grid-cols-2">

                {/* Account Settings */}
                <div className="p-5 border rounded-xl bg-card shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-primary">Account Settings</h2>
                            <p className="text-xs text-muted-foreground">Profile information and password</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-medium px-3 py-1">
                        <Clock className="h-3 w-3" />
                        Coming Soon
                    </span>
                </div>

                {/* App Preferences */}
                <div className="p-5 border rounded-xl bg-card shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center">
                            <Palette className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-primary">App Preferences</h2>
                            <p className="text-xs text-muted-foreground">Theme and display settings</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-medium px-3 py-1">
                        <Clock className="h-3 w-3" />
                        Coming Soon
                    </span>
                </div>

                {/* Notifications */}
                <div className="p-5 border rounded-xl bg-card shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Bell className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-primary">Notifications</h2>
                            <p className="text-xs text-muted-foreground">Email and push notification preferences</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-medium px-3 py-1">
                        <Clock className="h-3 w-3" />
                        Coming Soon
                    </span>
                </div>

                {/* Security */}
                <div className="p-5 border rounded-xl bg-card shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-primary">Security</h2>
                            <p className="text-xs text-muted-foreground">Two-factor auth and sessions</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-xs font-medium px-3 py-1">
                        <Clock className="h-3 w-3" />
                        Coming Soon
                    </span>
                </div>

            </div>
        </div>
    );
}
