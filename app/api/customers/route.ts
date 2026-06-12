import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? "";
    const status = searchParams.get("status") ?? "all";
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "50");

    const where: Prisma.CustomerWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
      ];
    }
    if (status !== "all") {
      where.status = status;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        orderBy: { totalSpend: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          totalSpend: true,
          orderCount: true,
          lastOrderAt: true,
          tags: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return NextResponse.json({ customers, total, page, limit });
  } catch (err) {
    console.error("[/api/customers GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}