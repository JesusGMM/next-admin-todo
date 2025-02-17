'use server';

import { revalidatePath } from 'next/cache';

import { Todo } from '@prisma/client';
import prisma from '@/lib/prisma';

import { getUserSessionServer } from '@/auth/actions/auth-actions';


export const sleep = async (seconds: number = 0) => {

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, seconds * 1000);
  });

}


export const toggleTodo = async (id: string, complete: boolean): Promise<Todo> => {

  await sleep(1);

  const todo = await prisma.todo.findFirst({ where: { id } });

  if (!todo) {
    throw `Todo con id ${id} no encontrado`;
  }

  const updatedTodo = await prisma.todo.update({
    where: { id },
    data: { complete }
  });

  revalidatePath('/dashboard/server-todos');
  return updatedTodo;

}

export const addTodo = async (description: string) => {
  try {
    const user = await getUserSessionServer();

    console.log(user);

    const todo = await prisma.todo.create({ data: { description, userId: user!.id } });

    revalidatePath("/dashboard/server-todos");

    return todo;
  } catch {
    return {
      message: "Error creando todo",
    };
  }
};


// export const addTodo = async (description: string) => {

//   try {

//     const todo = await prisma.todo.create({ data: { description } })
//     revalidatePath('/dashboard/server-todos');

//     return todo;

//   } catch (error) {
//     return {
//       message: `Error creando todo: ${error}`
//     }
//   }

// }


export const deleteCompleted = async (): Promise<void> => {

  await prisma.todo.deleteMany({ where: { complete: true } });
  revalidatePath('/dashboard/server-todos');

}