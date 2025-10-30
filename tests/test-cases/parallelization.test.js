import { createPool } from "../../modules/workers/workerpool";
import { makeGroupParallel } from "../../modules/workers/finitegroup.parallel";
import { FiniteGroup } from "../../modules/finitegroup.new";

const pools = createPool(); 