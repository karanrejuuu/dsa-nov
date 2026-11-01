// DSA Quest Audio - Strictly Silent as specified in Add-on requirements
class SoundEffects {
  public setEnabled(_val: boolean) {}
  public isEnabled(): boolean {
    return false;
  }
  public playClick() {}
  public playSuccess() {}
  public playLevelUp() {}
  public playBossAlert() {}
}

export const soundManager = new SoundEffects();
