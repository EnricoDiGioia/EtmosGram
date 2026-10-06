# Atualizações do banco

Esta pasta guarda as mudanças no banco feitas depois que o EtmosGram foi para o ar.

O `setup.sql` já tem tudo o que existia no FargusGram em 01/10/2026, então um banco novo não precisa de nada daqui.

Quando surgir uma novidade (aqui ou no FargusGram):

1. Crie um arquivo `AAAA-MM-nome.sql` nesta pasta. Ele não pode apagar dados e precisa poder rodar mais de uma vez.
2. Coloque a mesma mudança no `setup.sql`.
3. No Supabase do EtmosGram, abra **SQL Editor** → **New query**, cole o arquivo e clique em **Run**.

Um arquivo vindo do FargusGram funciona aqui sem mudanças, porque as tabelas e funções têm os mesmos nomes. Só as regras do Storage mudaram de nome (`etmos_media_*` no lugar de `fargus_media_*`): se o arquivo mexer nelas, troque o prefixo.
