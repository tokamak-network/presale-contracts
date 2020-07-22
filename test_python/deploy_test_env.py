import json
import numpy as np
from web3 import Web3, HTTPProvider
from eth_utils import to_hex


# RPC_URL = "https://rinkeby.infura.io/v3/a608d5cd0f1e42109d964abdffe5d8d9"
RPC_URL = "http://127.0.0.1:8545"
ACCOUNTS_PATH = "config/accounts.json"

ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
TX_GAS_LIMIT = 5000000
TX_GAS_PRICE = 100000000000

COMPILED_VESTING_TOKEN_PATH = "../build/contracts/VestingToken.json"
COMPILED_TON_PATH = "../build/contracts/TON.json"
COMPILED_SWAPPER_PATH = "../build/contracts/Swapper.json"
COMPILED_MTON_PATH = "../plasma-evm-contracts/build/contracts/MTON.json"

VESTING_INFO_INDEX_ISINITIATED = 0
VESTING_INFO_INDEX_START = 1
VESTING_INFO_INDEX_CLIFF = 2
VESTING_INFO_INDEX_DURATION_UNIT = 3
VESTING_INFO_INDEX_DURATION_IN_SECONDS = 4
VESTING_INFO_INDEX_RATIO = 5

VESTING_DURATION_UNIT_IN_SECONDS = 60*60*24*30

VESTING_TOKEN_COUNT = 3
VESTING_TOKEN_TOTAL_SUPPLY = 1000000 * 10**18
VESTING_TOKEN_AMOUNT_MAX = 10**6
RATIO_MAX = 50
TON_TOTAL_SUPPLY = VESTING_TOKEN_TOTAL_SUPPLY * RATIO_MAX * VESTING_TOKEN_COUNT

w3 = Web3(HTTPProvider(RPC_URL))

class Tracker:
    def __init__(self, tokens, holders):
        print(f"tokens : {tokens}")
        print(f"holders : {holders}")
        self.init_amount = {}
        self.ratios = {}
        for token in tokens:
            self.init_amount[token] = {}
            for holder in holders:
                #amount = int(np.random.choice(int(np.uint64(-1)/2), 1)[0])
                amount = int(np.random.choice(VESTING_TOKEN_AMOUNT_MAX, 1)[0])
                self.init_amount[token][holder] = amount
            ratio = int(np.random.choice(range(1, RATIO_MAX), 1)[0])
            self.ratios[token] = ratio

        # calculate result ton
        self.expected_ton = {}
        for holder in holders:
            self.expected_ton[holder] = 0
            for token in tokens:
                self.expected_ton[holder] += self.init_amount[token][holder] * self.ratios[token]

    def get_init_amount(self, token, holder):
        return self.init_amount[token][holder]

    def get_ratio(self, token):
        return self.ratios[token]

    def get_expected_ton(self, holder):
        return self.expected_ton[holder]

    def check_ton(self, holder, ton_amount):
        print(f"expected: {self.expected_ton[holder]}, got: {ton_amount}")
        assert self.expected_ton[holder] == ton_amount

def get_accounts():
    with open(ACCOUNTS_PATH, "r") as f:
        data = json.load(f)
        return data
    return None
accounts = get_accounts()
owner = accounts["owner"]

def get_holders():
    return [accounts[x] for x in filter(lambda k: k.find("holder") != -1, accounts)]
holders = get_holders()
holders_address = [x["address"] for x in holders]

def print_step(name):
    print("#"*80)
    print("#### " + name)

def time_increase_to(duration):
    block = w3.eth.getBlock("latest")
    current_time = block["timestamp"]
    w3.provider.make_request("evm_increaseTime", [duration])
    w3.provider.make_request("evm_mine", None)

def send_raw_transaction(unsigned_tx, sender):
    unsigned_tx.update({"gas" : TX_GAS_LIMIT})
    unsigned_tx.update({"gasPrice" : TX_GAS_PRICE})
    unsigned_tx.update({"nonce" : w3.eth.getTransactionCount(sender["address"])})
    signed_tx = w3.eth.account.signTransaction(unsigned_tx, sender["privateKey"])
    
    tx_hash = w3.eth.sendRawTransaction(signed_tx.rawTransaction)
    print(f"tx : {tx_hash.hex()}")
    tx_receipt = w3.eth.waitForTransactionReceipt(tx_hash)
    return tx_hash, tx_receipt

def send(func, sender):
    unsigned_tx = func.buildTransaction({"from": sender["address"]})
    tx_hash, tx_receipt = send_raw_transaction(unsigned_tx, sender)

def deploy_contract(compiled_path, *contructor_params):
    data = None
    with open(compiled_path, "r") as f:
        data = json.load(f)

    print_step("deploy contract")
    print(f"path : {compiled_path}")
    unsigned_tx = w3.eth.contract(
        abi=data["abi"],
        bytecode=data["bytecode"]).constructor(*contructor_params).buildTransaction()
    tx_hash, tx_receipt = send_raw_transaction(unsigned_tx, owner)

    instance = w3.eth.contract(
        address=tx_receipt["contractAddress"],
        abi=data["abi"])

    #print(f"name : {instance.functions.name().call()}")
    print(f"address : {tx_receipt['contractAddress']}")

    return instance

def init_vestingtoken(token, total_supply):
    token.functions.generateTokens(owner, total_supply)

def get_block_time():
    return w3.eth.getBlock("latest").timestamp

vesting_tokens = []
for i in range(VESTING_TOKEN_COUNT):
    vesting_tokens.append(deploy_contract(COMPILED_VESTING_TOKEN_PATH, ZERO_ADDRESS, ZERO_ADDRESS, 0, f"Test VestingToken {i+1}", 18, f"TestTON{i+1}", True))
vesting_tokens_address = [x.address for x in vesting_tokens]
mton = deploy_contract(COMPILED_MTON_PATH)
ton = deploy_contract(COMPILED_TON_PATH)
swapper = deploy_contract(COMPILED_SWAPPER_PATH, ton.address)

tracker = Tracker(vesting_tokens_address, holders_address)

print_step("generate tokens")

for i in range(VESTING_TOKEN_COUNT):
    send(vesting_tokens[i].functions.generateTokens(owner["address"], VESTING_TOKEN_TOTAL_SUPPLY), owner)
send(ton.functions.mint(owner["address"], TON_TOTAL_SUPPLY), owner)
send(ton.functions.transfer(swapper.address, TON_TOTAL_SUPPLY), owner)

print_step("source token transfer")

for token in vesting_tokens:
    for i in range(len(holders)):
        send(token.functions.transfer(holders[i]["address"], tracker.get_init_amount(token.address, holders_address[i])), owner)

print_step("update rate")

for i in range(len(vesting_tokens)):
    send(swapper.functions.updateRatio(vesting_tokens[i].address, tracker.get_ratio(vesting_tokens[i].address)), owner)

print_step("change controller of vesting tokens")

for token in vesting_tokens:
    send(token.functions.changeController(swapper.address), owner)


print_step("initiate vesting tokens")
current_time = get_block_time()
start_time = current_time + 99999
for token in vesting_tokens:
    send(swapper.functions.initiate(token.address, start_time, 0, 10), owner)

print_step("get vesting info")
for token in vesting_tokens:
    info = swapper.functions.vestingInfo(token.address).call({"from": holders_address[0]});
    print(f"info : {info}");

print_step("register vesting token amount before start")
for holder in holders:
    for token in vesting_tokens:
        amount = token.functions.balanceOf(holder["address"]).call({"from": holder["address"]})
        #print(f"swapper : {swapper.address}")
        #print(f"amount : {amount}")
        total = swapper.functions.totalAmount(token.address, holder["address"]).call({"from": holder["address"]})
        #print(f"total : {total}")
        send(token.functions.approveAndCall(swapper.address, amount, ""), holder)
        amount = token.functions.balanceOf(holder["address"]).call({"from": holder["address"]})
        #print(f"amount after : {amount}")
        total = swapper.functions.totalAmount(token.address, holder["address"]).call({"from": holder["address"]})
        #print(f"total : {total}")

print_step("swap before start")
for token in vesting_tokens:
    for holder in holders:
        released_amount1 = swapper.functions.released(token.address, holder["address"]).call({"from": holder["address"]})
        ton_amount1 = ton.functions.balanceOf(holder["address"]).call({"from": holder["address"]})

        send(swapper.functions.swap(token.address), holder)

        released_amount2 = swapper.functions.released(token.address, holder["address"]).call({"from": holder["address"]})
        assert released_amount1 == released_amount2
        ton_amount2 = ton.functions.balanceOf(holder["address"]).call({"from": holder["address"]})
        assert ton_amount1 == ton_amount2

print_step("swap after start (first duration unit)")

current_time = get_block_time()
time_increase_to(start_time - current_time + 1)

def swap(token, holder, shouldIncreaseTon):
    current_time = get_block_time()
    vesting_info = swapper.functions.vestingInfo(token.address).call({"from": holder["address"]})
    #print(f"current: {current_time}, info: {vesting_info}")

    released_amount1 = swapper.functions.released(token.address, holder["address"]).call({"from": holder["address"]})
    ton_amount1 = ton.functions.balanceOf(holder["address"]).call({"from": holder["address"]})

    send(swapper.functions.swap(token.address), holder)

    released_amount2 = swapper.functions.released(token.address, holder["address"]).call({"from": holder["address"]})
    #print("#"*80)
    #print(f"1: {released_amount1}, 2: {released_amount2}")
    if shouldIncreaseTon:
        assert released_amount1 < released_amount2
    else:
        assert released_amount1 == released_amount2
    ton_amount2 = ton.functions.balanceOf(holder["address"]).call({"from": holder["address"]})
    #print(f"1: {ton_amount1}, 2: {ton_amount2}")
    if shouldIncreaseTon:
        assert ton_amount1 < ton_amount2
    else:
        assert ton_amount1 == ton_amount2

for token in vesting_tokens:
    for holder in holders:
        swap(token, holder, True)

for token in vesting_tokens:
    for holder in holders:
        swap(token, holder, False)

print_step("swap repeat")

time_increase_to(VESTING_DURATION_UNIT_IN_SECONDS)
current_time = get_block_time()
vesting_info = swapper.functions.vestingInfo(token.address).call({"from": holder["address"]})
end_time = vesting_info[VESTING_INFO_INDEX_START] + vesting_info[VESTING_INFO_INDEX_DURATION_IN_SECONDS]
while current_time < end_time:
    print("#"*80)
    vesting_info = swapper.functions.vestingInfo(token.address).call({"from": holder["address"]})
    print(f"current_time: {current_time}, info: {vesting_info}")
    for token in vesting_tokens:
        for holder in holders:
            swap(token, holder, True)
    time_increase_to(60*60*24)
    for token in vesting_tokens:
        for holder in holders:
            swap(token, holder, False)
    time_increase_to(VESTING_DURATION_UNIT_IN_SECONDS)
    current_time = get_block_time()

for token in vesting_tokens:
    for holder in holders:
        swap(token, holder, False)
        ton_amount = ton.functions.balanceOf(holder["address"]).call({"from": holder["address"]})
        tracker.check_ton(holder["address"], ton_amount)
