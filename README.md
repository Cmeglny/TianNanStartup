# TianNanStartup

Discord'un ilk açılışına gümüş/antrasit giriş ekranı ekler. Sonra sunucu listesi, kanallar, sohbet, üyeler ve kontroller perspektif ve dalga efektleriyle sırayla gelir.

- Yalnızca açılışta bir kez oynar. Ctrl+R ile tam sayfa yenilemek de yeni açılış sayılır.
- Normalde toplam yaklaşık 9 saniye sürer. Esc veya ATLA ile geçilebilir.
- Uygulamaya tıklamak ya da kanal değiştirmek bileşen sahnesini sonlandırır.
- Sistem azaltılmış hareket tercihine uyar.
- Tema kurulumu gerektirmez; ejderha arka planı için aşağıdaki GIF adımı gerekir.

### GIF arka planı

GIF dosyası bu kaynak paketine dahil değildir. Kendi GIF'ini `tian-nan-pingpong.gif` olarak adlandırıp Windows'ta şu klasöre koy:

```text
%APPDATA%\Vencord\themes\assets\tian-nan-pingpong.gif
```

`assets` klasörü yoksa oluştur. Bu klasöre Vencord → Themes → Open Themes Folder üzerinden de ulaşabilirsin. Diğer sistemlerde Vencord'un tema klasöründe aynı `assets` alt klasörünü kullan.

Eklenti `vencord:///themes/assets/tian-nan-pingpong.gif` adresini kullanır. GIF olmadan da giriş efektleri koyu arka plan üzerinde çalışır. Başka bir dosya adı veya HTTPS adresi kullanmak istersen `style.css` içindeki `.vc-tiannan-scene` arka planını değiştirip yeniden derle.

## Kurulum

Bu depo, Vencord için özel bir **userplugin** içerir. Git, Node.js ve pnpm gerekir.

### Vencord kaynak klasörün yoksa

```powershell
git clone https://github.com/Vendicated/Vencord
cd Vencord
pnpm install --frozen-lockfile
```

### Eklentiyi ekle

Vencord kaynak klasöründeyken şu komutları çalıştır:

```powershell
git clone https://github.com/Cmeglny/TianNanStartup src/userplugins/tianNanStartup
pnpm build
```

Kaynak derlemesini Discord Desktop'a ilk kez kuruyorsan Discord'u sistem tepsisinden tamamen kapatıp şu komutu çalıştır:

```powershell
pnpm inject
```

Açılan Vencord Installer'da kullandığın Discord kurulumunu seçip kurulumu uygula. Discord'u yeniden aç. Ayarlar → Vencord → Plugins → **TianNanStartup** bölümünden eklentiyi açıp kapatabilirsin. Mevcut özel kaynak kurulumunda yeniden derleyip Discord'u tamamen kapatıp açmak yeterlidir.

Git kullanmadan eklemek için GitHub'da Code → Download ZIP ile indirip çıkar. `index.ts` doğrudan `Vencord/src/userplugins/tianNanStartup/index.ts` konumunda olacak şekilde eklenti klasörünü yerleştir; ardından yukarıdaki derleme adımını uygula. Vencord kaynak klasörünü koru.

Resmî rehberler: [Vencord'u kaynaktan kurma](https://docs.vencord.dev/installing/) · [Özel eklenti ekleme](https://docs.vencord.dev/installing/custom-plugins/)

## Güncelleme

Git ile kurduysan Vencord kaynak klasöründen:

```powershell
git -C src/userplugins/tianNanStartup pull --ff-only
pnpm build
```

Ardından Discord'u tamamen kapatıp aç. ZIP ile kurduysan kaynak dosyalarını yeni sürümle değiştirip yeniden derle.

## Uyumluluk

Kaynaklar Vencord 1.15.14 / `644434941b515a2626a2161e219653cb36e723e7` ile kontrol edildi. Discord'un bileşen yapısı veya Vencord API'leri değişirse uyarlama gerekebilir.

## Lisans

Copyright © 2026 cemuu. **GPL-3.0-or-later**. Lisans metni [LICENSE](LICENSE) dosyasındadır. Bu eklenti bağımsız bir özel eklentidir.
