interface Env {
  GAME_SAVES: KVNamespace;
}

interface SaveGameRequest {
  userId: string;
  saveData: unknown;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = (await context.request.json()) as SaveGameRequest;
    const { userId, saveData } = body;

    if (!userId || !saveData) {
      return Response.json(
        { success: false, message: 'userId and saveData are required' },
        { status: 400 }
      );
    }

    const key = `save:${userId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    await context.env.GAME_SAVES.put(key, JSON.stringify(saveData));

    return Response.json({
      success: true,
      message: 'Game saved successfully',
    });
  } catch (error) {
    return Response.json(
      { success: false, message: 'Failed to save game' },
      { status: 500 }
    );
  }
};
