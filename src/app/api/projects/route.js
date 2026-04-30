import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let projects;
    if (session.user.role === 'ADMIN') {
      // Admin sees all projects
      projects = await prisma.project.findMany({
        include: {
          owner: { select: { name: true, email: true } },
          _count: { select: { tasks: true, members: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Member sees projects they are a part of
      projects = await prisma.project.findMany({
        where: {
          members: {
            some: { id: session.user.id }
          }
        },
        include: {
          owner: { select: { name: true, email: true } },
          _count: { select: { tasks: true, members: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('Fetch Projects Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Admins only' }, { status: 403 });
    }

    const { name, description } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'Project name is required' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: session.user.id,
        members: {
          connect: { id: session.user.id } // Auto-add owner as a member
        }
      }
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Create Project Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
