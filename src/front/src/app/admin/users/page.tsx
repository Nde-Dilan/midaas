"use client";

import { useEffect, useState } from "react";
import { adminProvider, type AdminUserItem } from "@/api/admin";
import { useAdminStore } from "@/store/admin";
import { Button } from "@/components/atoms/button";
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  BadgeCheck,
  BadgeX,
  User as UserIcon,
} from "lucide-react";
import { toast } from "react-toastify";

export default function AdminUsersPage() {
  const { users, setUsers, setUsersLoading } = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setUsersLoading(true);
    const { data, error } = await adminProvider.getUsers();
    if (data) {
      setUsers(data);
    } else {
      toast.error(error || "Failed to load users");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (users.length === 0) {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone_number?.toLowerCase().includes(q) ||
      u.id_card_number?.toLowerCase().includes(q)
    );
  });

  const entrepreneursCount = users.filter((u) => u.is_entrepreneur).length;

  // Stats
  const verifiedIdCount = users.filter((u) => u.id_card_url).length;

  return (
    <section className="p-6">
      <div className="max-w-[1400px] mx-auto mt-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-MontserratBold text-gray-900">
              Users
            </h1>
            <p className="text-gray-500 text-sm mt-1">All platform users</p>
          </div>
          <Button
            onClick={fetchUsers}
            variant="outline"
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00CCC0]/20 focus:border-[#00CCC0] transition-all"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Total</p>
              <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Entrepreneurs</p>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-emerald-600">
              {entrepreneursCount}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">ID Document</p>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-blue-600">
              {verifiedIdCount}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">No ID</p>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <BadgeX className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-amber-600">
              {users.length - verifiedIdCount}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-8 h-8 animate-spin text-gray-300" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Users className="w-16 h-16 text-gray-200" />
                <p className="text-gray-500 font-MontserratSemiBold text-lg">
                  No users found
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-gray-50/50">
                    <th className="text-left px-5 py-3.5 text-xs font-MontserratSemiBold text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-MontserratSemiBold text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-MontserratSemiBold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-MontserratSemiBold text-gray-500 uppercase tracking-wider">
                      ID Card
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-MontserratSemiBold text-gray-500 uppercase tracking-wider">
                      Registered
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#5E0E08] to-[#7A1A12] flex items-center justify-center flex-shrink-0">
                            <UserIcon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="font-MontserratSemiBold text-gray-900 text-sm">
                              {user.full_name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              ID: {user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {user.email || "—"}
                          </div>
                          {user.phone_number && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <Phone className="w-3.5 h-3.5 text-gray-400" />
                              {user.phone_number}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {user.is_entrepreneur ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <BadgeCheck className="w-3 h-3" />
                            Entrepreneur
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                            <UserIcon className="w-3 h-3" />
                            Investor
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {user.id_card_url ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                            <BadgeCheck className="w-3.5 h-3.5" />
                            Provided
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                            <BadgeX className="w-3.5 h-3.5" />
                            Not provided
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
