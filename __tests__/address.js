const { isAddressValid } = require('../src/utils/address');

describe('address', () => {
  it('accept valid address', async () => {
    expect(isAddressValid('A00D0CF9099287F92B98BCDF28D40684A1A70C1E83')).toBeTruthy();
    expect(isAddressValid('A030975C3437C94118C924241ADF2A937010889B6D')).toBeTruthy();
    expect(isAddressValid('A08B5B1D533EFA3D098D34D3CA4FD908130856DA4B')).toBeTruthy();
  });

  it('reject addresses of invalid length', async () => {
    expect(isAddressValid('A00D0CF9099287F92B98BCDF28DA0684A11E83')).toBeFalsy();
    expect(isAddressValid('A00D0CF9099287F92B98BCDF28DA01E83')).toBeFalsy();
    expect(isAddressValid('A00D0CF9099287F92B98BCDF1E83')).toBeFalsy();
    expect(isAddressValid('A00D0CF9099287F92B91E83')).toBeFalsy();
    expect(isAddressValid('A00D0CF9099287F1E83')).toBeFalsy();
    expect(isAddressValid('A00D0CF90991E83')).toBeFalsy();
    expect(isAddressValid('A00D0C1E83'));
    expect(isAddressValid('')).toBeFalsy();
  });

  it('reject invalid addresses', async () => {
    expect(isAddressValid('')).toBeFalsy();
    expect(isAddressValid()).toBeFalsy();
    expect(isAddressValid(null)).toBeFalsy();
    expect(isAddressValid(undefined)).toBeFalsy();
    expect(isAddressValid(false)).toBeFalsy();
    expect(isAddressValid(true)).toBeFalsy();
    expect(isAddressValid(1)).toBeFalsy();
    expect(isAddressValid(0)).toBeFalsy();
  });
});
