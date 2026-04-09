interface Env {
  GAME_SAVES: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return Response.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      );
    }

    const key = `save:${userId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const data = await context.env.GAME_SAVES.get(key);

    if (!data) {
      return Response.json(
        { success: false, message: 'Save file not found' },
        { status: 404 }
      );
    }

    const saveData = JSON.parse(data);
    return Response.json({ success: true, saveData });
  } catch (error) {
    return Response.json(
      { success: false, message: 'Failed to load game' },
      { status: 500 }
    );
  }
};
