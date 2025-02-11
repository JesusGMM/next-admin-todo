import prisma from '@/lib/prisma';
import { Todo } from '@prisma/client';
import { NextResponse } from 'next/server';
import * as yup from 'yup';

interface Segments {
  params: Promise<{ id: string }>
}

const putSchema = yup.object({
  complete: yup.boolean().optional(),
  description: yup.string().optional(),
})

const getTodo = async (id: string): Promise<Todo | null> => {
  const todo = await prisma.todo.findFirst({ where: { id } });
  return todo;
}

export async function GET(request: Request, { params }: Segments) {
  const { id } = await params;
  const todo = await getTodo(id);

  if (!todo) {
    return NextResponse.json({ message: `Todo con id ${id} no existe` }, { status: 404 });
  }


  return NextResponse.json(todo);
}

export async function PUT(request: Request, { params }: Segments) {

  try {
    const { id } = await params;
    const todo = await getTodo(id);

    if (!todo) {
      return NextResponse.json({ message: `Todo con id ${id} no existe` }, { status: 404 });
    }

    const { complete, description } = await putSchema.validate(await request.json());


    const updatedTodo = await prisma.todo.update({
      where: { id },
      data: { complete, description }
    })



    return NextResponse.json(updatedTodo);

  } catch (error) {
    return NextResponse.json(error, { status: 400 });
  }
}